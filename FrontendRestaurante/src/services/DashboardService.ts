import type { CashFlowByDayDTO } from "@/DTO/CashFlowByDayDto";
import { CustomerRetentionDTO } from "@/DTO/CustomerRetentionDto";
import type { DeliveryLocationDTO } from "@/DTO/DeliveryLocationDto";
import type { PaymentsByTypeDTO } from "@/DTO/PaymentsByTypeDto";
import type { RegionPerformanceDTO } from "@/DTO/RegionPerformanceDto";
import type { SalesByChannelDescriptionDTO } from "@/DTO/SalesByChannelDescriptionDto";
import type { TemporalInputDto } from "@/DTO/TemporalInputDto";
import type { TopItemDTO } from "@/DTO/TopItemDto";
import type { WeeklyAverageTicketDTO } from "@/DTO/WeeklyAverageTicketDto";
import type { WeeklyDeliveriesDTO } from "@/DTO/WeeklyDeliveriesDTO";
import type { WeeklyRevenueDTO } from "@/DTO/WeeklyRevenueDTO ";
import type { AxiosInstance } from "axios";

export default class DashboardService {
  constructor(readonly http: AxiosInstance) {}

  async getCashFlowChart(data: TemporalInputDto): Promise<CashFlowByDayDTO[]> {
    const response = await this.http.post<CashFlowByDayDTO[]>('/dashboard/cashFlowChart', data);
    return response.data;
  }

  async getDeliveryLocationsChart(data: TemporalInputDto): Promise<DeliveryLocationDTO[]> {
    const response = await this.http.post<DeliveryLocationDTO[]>('/dashboard/deliveryLocationsChart', data);
    return response.data;
  }

  async getPaymentsByTypeChart(data: TemporalInputDto): Promise<PaymentsByTypeDTO[]> {
    const response = await this.http.post<PaymentsByTypeDTO[]>('/dashboard/paymentsByTypeChart', data);
    return response.data;
  }

  async getPerformanceByRegionChart(data: TemporalInputDto): Promise<RegionPerformanceDTO[]> {
    const response = await this.http.post<RegionPerformanceDTO[]>('/dashboard/performanceByRegionChart', data);
    return response.data;
  }

  async getSalesByChannelDescriptionChart(data: TemporalInputDto): Promise<SalesByChannelDescriptionDTO[]> {
    const response = await this.http.post<SalesByChannelDescriptionDTO[]>('/dashboard/salesByChannelDescriptionChart', data);
    return response.data;
  }

  async getTopItemsChart(data: TemporalInputDto): Promise<TopItemDTO[]> {
    const response = await this.http.post<TopItemDTO[]>('/dashboard/topItemsChart', data);
    return response.data;
  }

  async getCustomerRetention(data: TemporalInputDto): Promise<CustomerRetentionDTO[]> {
    const response = await this.http.post<CustomerRetentionDTO[]>('/dashboard/customerRetention', data);
    return response.data;
  }

  async getWeeklyAverageTicket(): Promise<WeeklyAverageTicketDTO[]> {
    const response = await this.http.get<WeeklyAverageTicketDTO[]>('/dashboard/weeklyAverageTicket');
    return response.data;
  }

  async getWeeklyRevenue(): Promise<WeeklyRevenueDTO[]> {
    const response = await this.http.get<WeeklyRevenueDTO[]>('/dashboard/weeklyRevenue');
    return response.data;
  }

  async getWeeklyDeliveries(): Promise<WeeklyDeliveriesDTO[]> {
    const response = await this.http.get<WeeklyDeliveriesDTO[]>('/dashboard/weeklyDeliveries');
    return response.data;
  }
}