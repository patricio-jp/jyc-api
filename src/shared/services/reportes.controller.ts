import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Endpoint para obtener créditos semanales agrupados por día de la semana.
   * Recibe fechaInicio y fechaFin como strings ISO o fechas parseables.
   */
  @Get('planilla/semanales')
  async getCreditosSemanalesPorDia(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return this.reportesService.getCreditosSemanalesPorDia(inicio, fin);
  }

  /**
   * Endpoint para obtener la planilla mensual de clientes con créditos activos.
   * Recibe mes y anio como query params (números).
   */
  @Get('planilla/mensual')
  async getPlanillaMensual(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.reportesService.getClientesConCreditosActivosOrdenados(
      Number(month),
      Number(year),
    );
  }
}
