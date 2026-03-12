using BCrypt.Net;
using FincaAppApplication.DTOs.Login;
using FincaAppApplication.Requests.AuthRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FincaAppApplication.Handlers.AuthHandler;

public class LoginHandler : IRequestHandler<LoginRequest, LoginResponse>
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtProvider _jwtProvider;
    private readonly ILogger<LoginHandler> _logger;

    public LoginHandler(
        IUsuarioRepository usuarioRepository,
        IJwtProvider jwtProvider,
        ILogger<LoginHandler> logger)
    {
        _usuarioRepository = usuarioRepository;
        _jwtProvider = jwtProvider;
        _logger = logger;
    }

    public async Task<LoginResponse> Handle(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        var verified = false;

        if (!string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            try
            {
                //verified = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                verified = request.Password == user.PasswordHash;
            }
            catch (BCrypt.Net.SaltParseException ex)
            {
                // Malformed/legacy password hash stored in DB — log and treat as invalid credentials
                _logger.LogWarning(ex, "Invalid password hash for user {Email}", request.Email);
                verified = false;
            }
        }

        if (!verified)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        var token = _jwtProvider.Generate(user.Id, user.TenantId);

        return new LoginResponse
        {
            UserId = user.Id,
            TenantId = user.TenantId,
            Token = token
        };
    }
}