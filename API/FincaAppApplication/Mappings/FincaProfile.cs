using AutoMapper;
using FincaAppApplication.DTOs.Finca;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappings;

public class FincaProfile : Profile
{
    public FincaProfile()
    {
        CreateMap<Finca, FincaDto>();
        CreateMap<CreateFincaRequestDto, Finca>();
    }
}
