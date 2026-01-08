using MediatR;
using FincaAppApplication.DTOs.Login;

namespace FincaAppApplication.Requests.AuthRequest;

public class LoginRequest : IRequest<LoginResponse>
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}
