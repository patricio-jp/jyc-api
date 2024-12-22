import { Injectable } from '@nestjs/common';

@Injectable()
export class FunctionsService {
  addMonth(date: Date): Date {
    const newDate = new Date(date.valueOf());
    newDate.setMonth(newDate.getMonth() + 1);

    // Si el nuevo mes tiene menos días que el día actual, ajusta el día
    if (newDate.getDate() < date.getDate()) {
      newDate.setDate(0); // Esto ajusta al último día del mes anterior
    }

    return newDate;
  }
}
