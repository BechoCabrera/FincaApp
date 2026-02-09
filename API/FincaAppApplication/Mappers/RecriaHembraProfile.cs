using AutoMapper;
using FincaAppApplication.DTOs.RecriaHembra;
using FincaAppApplication.Features.Requests.RecriasHembraRecuest;
using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Mappers
{
    public class RecriaHembraProfile : Profile
    {
        public RecriaHembraProfile()
        {
            CreateMap<RecriaHembra, RecriaHembraDto>().ReverseMap();
            CreateMap<CreateRecriaHembraRequest, RecriaHembra>();
        }
    }

}
