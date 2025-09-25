using AutoMapper;
using FincaAppApi.Domain.Entities;
using FincaAppApi.DTOs.Toro;

namespace FincaAppApi.Application.Features.Mappers
{
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
                .ForMember(dest => dest.Peso, opt => opt.MapFrom(src => src.Peso))
                .ForMember(dest => dest.Finca, opt => opt.MapFrom(src => src.Finca));
        }
    }
}
