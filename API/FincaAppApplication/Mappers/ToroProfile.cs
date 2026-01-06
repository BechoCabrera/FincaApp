using AutoMapper;
using FincaAppApi.DTOs.Toro;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappers;
public class ToroProfile : Profile
{
    public ToroProfile()
    {
        // Mapeo de Toro a ToroDto
        CreateMap<Toro, ToroDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Numero, opt => opt.MapFrom(src => src.Numero))
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre))
            .ForMember(dest => dest.FechaNacimiento, opt => opt.MapFrom(src => src.FechaNacimiento))
            .ForMember(dest => dest.Peso, opt => opt.MapFrom(src => src.PesoKg))
            .ForMember(dest => dest.Finca, opt => opt.MapFrom(src => src.FincaId));
    }
}