using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.DTOs;

namespace FincaAppApplication.Features.Animals.Queries
{
    public class GetAnimalTimelineQuery : IRequest<PagedResultDto<TimelineEventDto>>
    {
        public Guid AnimalId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class GetAnimalTimelineQueryHandler : IRequestHandler<GetAnimalTimelineQuery, PagedResultDto<TimelineEventDto>>
    {
        private readonly IPartoRepository _partoRepository;
        private readonly IAnimalEstadoHistorialRepository _estadoRepo;
        private readonly IAnimalMovimientoRepository _movimientoRepo;
        private readonly IAnimalPalpacionRepository _palpacionRepo;

        public GetAnimalTimelineQueryHandler(IPartoRepository partoRepository, IAnimalEstadoHistorialRepository estadoRepo, IAnimalMovimientoRepository movimientoRepo, IAnimalPalpacionRepository palpacionRepo)
        {
            _partoRepository = partoRepository;
            _estadoRepo = estadoRepo;
            _movimientoRepo = movimientoRepo;
            _palpacionRepo = palpacionRepo;
        }

        public async Task<PagedResultDto<TimelineEventDto>> Handle(GetAnimalTimelineQuery request, CancellationToken cancellationToken)
        {
            var events = new List<TimelineEventDto>();

            var partos = await _partoRepository.GetByMadreAsync(request.AnimalId);
            if (partos != null)
            {
                events.AddRange(partos.Select(p => new TimelineEventDto
                {
                    EventType = "Parto",
                    Date = p.FechaParto,
                    Description = $"Parto (cría: {p.CriaId})",
                    RelatedId = p.Id
                }));
            }

            try
            {
                var method = _estadoRepo?.GetType().GetMethod("GetByAnimalAsync");
                if (method != null)
                {
                    var task = (Task<List<FincaAppDomain.Entities.AnimalEstadoHistorial>>)method.Invoke(_estadoRepo, new object[] { request.AnimalId });
                    var estados = await task;
                    if (estados != null)
                    {
                        events.AddRange(estados.Select(e => new TimelineEventDto
                        {
                            EventType = "Estado",
                            Date = e.CreatedAt,
                            Description = $"Estado: {e.EstadoAnterior} -> {e.EstadoNuevo}",
                            RelatedId = e.Id
                        }));
                    }
                }
            }
            catch
            {
                // ignore
            }

            var movimientos = await _movimientoRepo.GetByAnimalAsync(request.AnimalId);
            if (movimientos != null)
            {
                events.AddRange(movimientos.Select(m => new TimelineEventDto
                {
                    EventType = "Movimiento",
                    Date = m.FechaMovimiento,
                    Description = $"Movimiento: {m.FincaOrigenId} -> {m.FincaDestinoId}",
                    RelatedId = m.Id
                }));
            }

            try
            {
                var method = _palpacionRepo?.GetType().GetMethod("GetByAnimalAsync");
                if (method != null)
                {
                    var task = (Task<List<FincaAppDomain.Entities.AnimalPalpacion>>)method.Invoke(_palpacionRepo, new object[] { request.AnimalId });
                    var palpaciones = await task;
                    if (palpaciones != null)
                    {
                        events.AddRange(palpaciones.Select(p => new TimelineEventDto
                        {
                            EventType = "Palpacion",
                            Date = p.FechaPalpacion,
                            Description = $"Palpación: {p.Notas}",
                            RelatedId = p.Id
                        }));
                    }
                }
            }
            catch
            {
                // ignore
            }

            // Order and compute total
            var ordered = events.OrderByDescending(e => e.Date).ToList();
            var total = ordered.Count;

            var paged = ordered.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();

            return new PagedResultDto<TimelineEventDto>
            {
                Items = paged,
                Total = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
