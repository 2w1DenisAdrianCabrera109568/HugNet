package com.hugnet.exchange_service.entity;

public enum ExchangeStatus {
    DISPONIBLE,  // Recién publicado, visible para todos
    RESERVADO,   // Alguien lo solicitó, pendiente de entrega (y QR)
    INTERCAMBIADO // El QR fue escaneado, la transacción se completó
}
