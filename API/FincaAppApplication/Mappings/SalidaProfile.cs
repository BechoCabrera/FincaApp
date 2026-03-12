using AutoMapper;
using FincaAppApplication.DTOs.Salida;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Mappings;

public class SalidaProfile : Profile
{
    public SalidaProfile()
    {
        CreateMap<AnimalSalida, VentaDto>();
    }
}
