using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Requests.AuthRequest;
using FincaAppApplication.DTOs.Login;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _mediator.Send(request);
        return Ok(response);
    }
}
