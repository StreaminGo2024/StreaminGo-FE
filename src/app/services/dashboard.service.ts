import { Injectable, signal } from "@angular/core";
import { BaseService } from "./base-service";
import { IMovieDashboard } from "../interfaces";

@Injectable({
    providedIn: 'root',
})
export class DashboardService extends BaseService<IMovieDashboard> {
    protected override source: string = 'movies';
    private movieListSignal = signal<IMovieDashboard[]>([]);
    get movies$() {
        return this.movieListSignal;
    }


    getAllSignal() {
        this.findAll().subscribe({
            next: (response: any) => {
                response.reverse();
                this.movieListSignal.set(response);
            },
            error: (error: any) => {
                console.error('Error fetching users', error);
            }
        });
    }

}