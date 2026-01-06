using System.Net;
using System.Text.Json;

namespace FincaAppApi.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            KeyNotFoundException => HttpStatusCode.NotFound,
            UnauthorizedAccessException => HttpStatusCode.Unauthorized,
            _ when IsUniqueConstraintViolation(exception) => HttpStatusCode.Conflict,
            _ => HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            status = context.Response.StatusCode,
            error = exception.Message
        };

        return context.Response.WriteAsync(
            JsonSerializer.Serialize(response)
        );
    }

    private static bool IsUniqueConstraintViolation(Exception ex)
    {
        // SQL Server
        return ex.InnerException?.Message.Contains("IX_Toros_TenantId_Numero") == true
               || ex.Message.Contains("duplicate", StringComparison.OrdinalIgnoreCase);
    }
}
