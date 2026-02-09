using AutoMapper;
using FincaAppApplication.DTOs.CriaMacho;
using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Mappers
{
    public class CriaMachoProfile : Profile
    {
        public CriaMachoProfile()
        {
            // Request -> Entidad
            CreateMap<CreateCriaMachoRequest, CriaMacho>()
                .ForMember(dest => dest.PesoKg,
                    opt => opt.MapFrom(src => src.PesoKg.HasValue ? (decimal?)src.PesoKg.Value : null));

            // Update request -> Entidad (opcional, si usas Update request)
            CreateMap<UpdateCriaMachoRequest, CriaMacho>()
                .ForMember(dest => dest.PesoKg,
                    opt => opt.MapFrom(src => src.PesoKg.HasValue ? (decimal?)src.PesoKg.Value : null));

            // Entidad -> DTO
            CreateMap<CriaMacho, CriaMachoDto>()
                .ForMember(dest => dest.PesoKg,
                    opt => opt.MapFrom(src => src.PesoKg.HasValue ? (double?)src.PesoKg.Value : null));
        }
    }
}
