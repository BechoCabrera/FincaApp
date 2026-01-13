using MediatR;
using FincaAppApplication.DTOs.Escotera;

namespace FincaAppApplication.Features.Requests.Escotera;

public record ListEscoterasRequest() : IRequest<List<EscoteraDto>>;
