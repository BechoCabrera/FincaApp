using AutoMapper;
using FincaAppApplication.DTOs.Finca;
using FincaAppApplication.Features.Requests.FincaRequest;
using FincaAppDomain.Interfaces;
using MediatR;

namespace FincaAppApplication.Features.Handlers.FincaHandler
{
    public class ListFincasHandler : IRequestHandler<ListFincasRequest, List<FincaDto>>
    {
        private readonly IFincaRepository _fincaRepository;
        private readonly IMapper _mapper;

        public ListFincasHandler(
            IFincaRepository fincaRepository,
            IMapper mapper)
        {
            _fincaRepository = fincaRepository;
            _mapper = mapper;
        }

        public async Task<List<FincaDto>> Handle(ListFincasRequest request, CancellationToken cancellationToken)
        {
            var fincas = await _fincaRepository.GetAllAsync();
            return _mapper.Map<List<FincaDto>>(fincas);
        }
    }
}
