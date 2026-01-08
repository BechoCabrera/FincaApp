using MediatR;
using FincaAppApplication.DTOs.Login;
using FincaAppApplication.Requests.AuthRequest;
using FincaAppDomain.Interfaces;
using FincaAppDomain.Common;

namespace FincaAppApplication.Handlers.AuthHandler;

public class LoginHandler : IRequestHandler<LoginRequest, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtProvider _jwtProvider;
    private readonly ITenantProvider _tenantProvider;

    public LoginHandler(
      IUserRepository userRepository,
      IJwtProvider jwtProvider,
      ITenantProvider tenantProvider)
    {
        _userRepository = userRepository;
        _jwtProvider = jwtProvider;
        _tenantProvider = tenantProvider;
    }

    

    public async Task<LoginResponse> Handle(
    LoginRequest request,
    CancellationToken cancellationToken)
    {
        var pass = BCrypt.Net.BCrypt.HashPassword("123456");
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null ||
            !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        // 🔑 EN LOGIN el tenant se obtiene del usuario
        var tenantId = user.UserTenants.First().TenantId;

        var token = _jwtProvider.Generate(user.Id, tenantId);

        return new LoginResponse
        {
            UserId = user.Id,
            TenantId = tenantId,
            Token = token
        };
    }


}
