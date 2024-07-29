import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts'; 
import { UserService } from '../../services/user.service';
import { IUserCountStats } from '../../interfaces';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsModule
  ], 
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit{
  @Input() usersStatsList: IUserCountStats[] = [];
  private service = inject(UserService);
  chartOptions: any;

  ngOnInit(): void {
    this.formatData(this.usersStatsList);
  }


  // ECharts options
  formatData(data: any[]): void {
    const months = data.map(item => `${item.year}-${item.month.toString().padStart(2, '0')}`);
    const counts = data.map(item => item.count);

    this.chartOptions = {
      title: {
        text: 'User Registrations per Month',
        textStyle: {
          color: '#fff', 
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{a}: {c}'
      },
      xAxis: {
        type: 'category',
        data: months
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'User Count',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: (params : any) => {
            const colors = ['#962DFF', '#F0E5FC']; 
            return colors[params.dataIndex % colors.length];
          }
        }
      }]
    };
  }
}

