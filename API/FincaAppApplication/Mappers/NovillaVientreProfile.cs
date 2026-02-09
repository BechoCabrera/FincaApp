using AutoMapper;
using FincaAppApplication.DTOs.NovillaVientre;
using FincaAppApplication.Features.Requests.NovillaVientreRequest;
using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Mappers
{
    public class NovillaVientreProfile : Profile
    {
        public NovillaVientreProfile()
        {
            CreateMap<NovillaVientre, NovillaVientreDto>().ReverseMap();
            CreateMap<CreateNovillaVientreRequest, NovillaVientre>();
        }
    }
}
