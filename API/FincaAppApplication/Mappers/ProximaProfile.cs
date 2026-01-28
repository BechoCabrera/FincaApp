using AutoMapper;
using FincaAppDomain.Entities;
using FincaAppApplication.DTOs.Proxima;

namespace FincaAppApplication.Mappings;

public class ProximaProfile : Profile
{
    public ProximaProfile()
    {
        CreateMap<Proxima, ProximaDto>();
    }
}
