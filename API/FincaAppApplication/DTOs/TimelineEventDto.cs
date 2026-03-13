using System;

namespace FincaAppApplication.DTOs
{
    public class TimelineEventDto
    {
        // Parto, Movimiento, Palpacion, Peso, Salida, Estado
        public string EventType { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? Source { get; set; }
        public Guid? RelatedId { get; set; }
    }
}
