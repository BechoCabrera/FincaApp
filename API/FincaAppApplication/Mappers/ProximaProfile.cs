using AutoMapper;
using FincaAppDomain.Entities;
using FincaAppApplication.DTOs.Proxima;
using FincaAppApplication.DTOs.Proximas;

namespace FincaAppApplication.Mappings;

public class ProximaProfile : Profile
{
    public ProximaProfile()
    {
        CreateMap<Proxima, ProximaDto>().ReverseMap();

        // Mapeo para creación
        CreateMap<CreateProximaDto, Proxima>();
    }
}
