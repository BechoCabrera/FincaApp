using AutoMapper;
using FincaAppApplication.DTOs.RecriasMacho;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasMachoHandler
{
    public class ListRecriasMachosHandler : IRequestHandler<ListRecriasMachosRequest, IReadOnlyList<RecriaMachoDto>>
    {
        private readonly IRecriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public ListRecriasMachosHandler(IRecriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<IReadOnlyList<RecriaMachoDto>> Handle(ListRecriasMachosRequest request, CancellationToken ct)
        {
            var list = await _repo.SearchAsync(request.Nombre, ct);
            return _mapper.Map<IReadOnlyList<RecriaMachoDto>>(list);
        }
    }
}
