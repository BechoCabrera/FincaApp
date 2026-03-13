using AutoMapper;
using FincaAppApplication.DTOs.Parto;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappings;

public class PartoProfile : Profile
{
    public PartoProfile()
    {
        CreateMap<Parto, PartoDto>();

        // map snapshot fields explicitly if naming differs (they match now)
    }
}
