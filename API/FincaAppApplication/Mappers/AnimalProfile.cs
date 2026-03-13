using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappings;

public class AnimalProfile : Profile
{
    public AnimalProfile()
    {
        CreateMap<Animal, AnimalDto>()
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre))
            .ForMember(dest => dest.NumeroArete, opt => opt.MapFrom(src => src.NumeroArete))
            .ForMember(dest => dest.FechaNacimiento, opt => opt.MapFrom(src => src.FechaNacimiento))
            .ForMember(dest => dest.FincaActualId, opt => opt.MapFrom(src => src.FincaActualId))
            .ForMember(dest => dest.EstadoActualHembra, opt => opt.MapFrom(src => src.EstadoActualHembra))
            .ForMember(dest => dest.EstadoActualMacho, opt => opt.MapFrom(src => src.EstadoActualMacho))
            .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
            .ForMember(dest => dest.TipoLeche, opt => opt.MapFrom(src => src.TipoLeche))
            .ForMember(dest => dest.Propietario, opt => opt.MapFrom(src => src.Propietario))
            .ForMember(dest => dest.PesoKg, opt => opt.MapFrom(src => src.PesoKg))
            .ForMember(dest => dest.Detalles, opt => opt.MapFrom(src => src.Detalles));
    }
}