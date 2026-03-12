using AutoMapper;
using FincaAppApplication.DTOs.Parto;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappings;

public class PartoProfile : Profile
{
    public PartoProfile()
    {
        CreateMap<Parto, PartoDto>();

        // If needed, map ParidaView from Parto + Madre (handled elsewhere if required)
    }
}
