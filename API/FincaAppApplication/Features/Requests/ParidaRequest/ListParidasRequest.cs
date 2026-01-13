using FincaAppApplication.DTOs.Parida;
using MediatR;


namespace FincaAppApplication.Features.Requests.ParidaRequest;

public record ListParidasRequest() : IRequest<List<ParidaDto>>;
