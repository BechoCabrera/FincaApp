using AutoMapper;
using FincaAppApplication.DTOs.Finca;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappers
{
    public class FincaProfile : Profile
    {
        public FincaProfile()
        {
            CreateMap<Finca, FincaDto>();
        }
    }
}
