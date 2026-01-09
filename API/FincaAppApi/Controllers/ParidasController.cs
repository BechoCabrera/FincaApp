using MediatR;
using Microsoft.AspNetCore.Mvc;
using FincaAppApplication.Features.Requests.ParidaRequest;

namespace FincaAppApi.Controllers;

[ApiController]
[Route("api/paridas")]
public class ParidasController : ControllerBase
{
    private readonly IMediator _mediator;

    public ParidasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Registrar una vaca parida
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateParidaRequest request)
    {
        var id = await _mediator.Send(request);
        return Ok(new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await _mediator.Send(new ListParidasRequest(), cancellationToken);
        return Ok(data);
    }
}
