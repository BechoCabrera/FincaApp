using BCrypt.Net;
using FincaAppApplication.DTOs.Login;
using FincaAppApplication.Requests.AuthRequest;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Handlers.AuthHandler;

public class LoginHandler : IRequestHandler<LoginRequest, LoginResponse>
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtProvider _jwtProvider;

    public LoginHandler(
        IUsuarioRepository usuarioRepository,
        IJwtProvider jwtProvider)
    {
        _usuarioRepository = usuarioRepository;
        _jwtProvider = jwtProvider;
    }

    public async Task<LoginResponse> Handle(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByEmailAsync(request.Email);

        if (user == null ||
            !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
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