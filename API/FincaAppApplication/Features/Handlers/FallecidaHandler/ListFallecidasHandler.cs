using FincaAppApplication.DTOs.Fallecida;
using FincaAppApplication.Features.Requests.FallecidaRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.FallecidaHandler
{
    public class ListFallecidasHandler : IRequestHandler<ListFallecidasRequest, List<FallecidaDto>>
    {
        private readonly IFallecidaRepository _fallecidaRepository;

        public ListFallecidasHandler(IFallecidaRepository fallecidaRepository)
        {
            _fallecidaRepository = fallecidaRepository;
        }

        public async Task<List<FallecidaDto>> Handle(ListFallecidasRequest request, CancellationToken cancellationToken)
        {
            var fallecidas = await _fallecidaRepository.GetAllByTenantAsync(Guid.Empty, cancellationToken);
            return fallecidas.Select(f => new FallecidaDto
            {
                Id = f.Id,
                Categoria = f.Categoria,
                AnimalId = f.AnimalId,
                FechaFallecimiento = f.FechaFallecimiento,
                Causa = f.Causa,
                Notas = f.Notas,
            }).ToList();
        }
    }
}
