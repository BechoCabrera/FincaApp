using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappings;

public class AnimalProfile : Profile
{
    public AnimalProfile()
    {
        CreateMap<Animal, AnimalDto>();
    }
}