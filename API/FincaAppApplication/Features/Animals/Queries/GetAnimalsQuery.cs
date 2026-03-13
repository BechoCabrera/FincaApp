using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Enums;
using FincaAppDomain.Interfaces;
using System.Linq;

namespace FincaAppApplication.Features.Animals.Queries
{
    public class GetAnimalsQuery : IRequest<List<AnimalDto>>
    {
        public TipoAnimal? Tipo { get; set; }
        public PropositoAnimal? Proposito { get; set; }
        public string? Estado { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class GetAnimalsQueryHandler : IRequestHandler<GetAnimalsQuery, List<AnimalDto>>
    {
        private readonly IAnimalRepository _repository;
        private readonly IPartoRepository _partoRepository;
        private readonly IMapper _mapper;

        public GetAnimalsQueryHandler(IAnimalRepository repository, IPartoRepository partoRepository, IMapper mapper)
        {
            _repository = repository;
            _partoRepository = partoRepository;
            _mapper = mapper;
        }

        public async Task<List<AnimalDto>> Handle(GetAnimalsQuery request, CancellationToken cancellationToken)
        {
            var animals = await _repository.GetAllAsync(
                request.Tipo,
                request.Proposito,
                request.Estado,
                request.Page,
                request.PageSize);

            var dtos = _mapper.Map<List<AnimalDto>>(animals);

            // Enrich hembra records with latest parto info when available
            for (int i = 0; i < animals.Count; i++)
            {
                var a = animals[i];
                var dto = dtos[i];

                // map basic tenant/created fields
                dto.CreatedAt = a.CreatedAt.ToString("o");
                dto.UpdatedAt = a.UpdatedAt?.ToString("o");

                // If this is a female and we want parto-related fields, try to get the latest parto
                if (a.Tipo == TipoAnimal.Hembra)
                {
                    var partos = await _partoRepository.GetByMadreAsync(a.Id);
                    var lastParto = partos?.OrderByDescending(p => p.FechaParto).FirstOrDefault();
                    if (lastParto != null)
                    {
                        dto.FechaParida = lastParto.FechaParto;
                        dto.FechaPalpacion = lastParto.FechaPalpacion;
                        dto.FechaNacimientoCria = lastParto.FechaNacimiento;
                        dto.Color = lastParto.Color;
                        dto.TipoLeche = lastParto.TipoLeche;
                        dto.Procedencia = lastParto.Procedencia;
                        dto.Propietario = lastParto.Propietario;
                        dto.Observaciones = lastParto.Observaciones;
                    }
                }
            }

            return dtos;
        }
    }
}
