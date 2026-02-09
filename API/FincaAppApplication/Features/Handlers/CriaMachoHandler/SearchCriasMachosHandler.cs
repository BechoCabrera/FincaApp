using AutoMapper;
using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.CriaMachoHandler
{
    public class SearchCriasMachosHandler : IRequestHandler<SearchCriasMachosRequest, List<FincaAppApplication.DTOs.CriaMacho.CriaMachoDto>>
    {
        private readonly ICriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public SearchCriasMachosHandler(ICriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<List<FincaAppApplication.DTOs.CriaMacho.CriaMachoDto>> Handle(SearchCriasMachosRequest request, CancellationToken ct)
        {
            var items = await _repo.GetAllAsync(ct);

            var filtered = items.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(request.Nombre))
                filtered = filtered.Where(x => !string.IsNullOrEmpty(x.Nombre) &&
                    x.Nombre.Contains(request.Nombre, StringComparison.OrdinalIgnoreCase));

            if (request.FincaId.HasValue)
                filtered = filtered.Where(x => x.FincaId == request.FincaId);

            var list = filtered.ToList();

            return _mapper.Map<List<FincaAppApplication.DTOs.CriaMacho.CriaMachoDto>>(list);
        }
    }
}
