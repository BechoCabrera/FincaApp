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
            .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre))
            .ForMember(dest => dest.FechaNac, opt => opt.MapFrom(src => src.FechaNac))
            .ForMember(dest => dest.PesoKg, opt => opt.MapFrom(src => src.PesoKg))
            .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
            .ForMember(dest => dest.Propietario, opt => opt.MapFrom(src => src.Propietario))
            .ForMember(dest => dest.Detalles, opt => opt.MapFrom(src => src.Detalles))
            .ForMember(dest => dest.MadreNumero, opt => opt.MapFrom(src => src.Madre != null ? src.Madre.Numero : null))
            .ForMember(dest => dest.FechaDestete, opt => opt.MapFrom(src => src.FechaDestete))
            .ForMember(dest => dest.FincaId, opt => opt.MapFrom(src => src.FincaId))
            .ForMember(dest => dest.MadreNombre, opt => opt.MapFrom(src => src.Madre != null ? src.Madre.Nombre : null))
            .ForMember(dest => dest.NombreFinca, opt => opt.MapFrom(src => src.Finca != null ? src.Finca.Nombre : null));
    }
}