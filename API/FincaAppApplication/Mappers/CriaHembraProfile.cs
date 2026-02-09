using AutoMapper;
using FincaAppDomain.Entities;
using FincaAppApplication.DTOs.CriaHembra;

namespace FincaAppApplication.Mappers;

public class CriaHembraProfile : Profile
{
    public CriaHembraProfile()
    {
        CreateMap<CriaHembra, CriaHembraDto>().ReverseMap();
        CreateMap<CreateCriaHembraDto, CriaHembra>();
    }
}