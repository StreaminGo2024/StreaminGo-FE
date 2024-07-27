import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent implements OnInit {

  videoSrc: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const videoId = params.get('video');
      if (videoId) {
        this.videoSrc = `http://localhost:8080/stream/${videoId}`;
      }
    });
  }

}
