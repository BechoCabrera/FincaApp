using MediatR;
using FincaAppApplication.DTOs.CriaHembra;

namespace FincaAppApplication.Features.Requests.CriaHembraRequest
{
    public class ListCriaHembrasRequest : IRequest<List<CriaHembraDto>>
    {
    }
}