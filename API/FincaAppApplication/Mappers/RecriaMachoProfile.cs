using AutoMapper;
using FincaAppApplication.DTOs.RecriasMacho;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Mappers
{
    internal class RecriaMachoProfile : Profile
    {
        public RecriaMachoProfile()
        {
            CreateMap<RecriaMacho, RecriaMachoDto>()
                .ForMember(dest => dest.MadreNombre, opt => opt.MapFrom(src => src.Madre != null ? src.Madre.Nombre : null))
                .ForMember(dest => dest.MadreNumero, opt => opt.MapFrom(src => src.Madre != null ? src.Madre.Numero : null));
            CreateMap<CreateRecriaMachoRequest, RecriaMacho>();
            CreateMap<UpdateRecriaMachoRequest, RecriaMacho>();
        }
    }
}
