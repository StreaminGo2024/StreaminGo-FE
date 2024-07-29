import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import videojs from 'video.js';
import { InviteModalComponent } from '../../components/invite-modal/invite-modal.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
  imports: [InviteModalComponent, ModalComponent],
  standalone: true
})
export class StreamComponent implements OnInit, OnDestroy {
  videoSrc: string = '';
  videoId: string = '';
  player: any | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const videoId = params.get('video');
      if (videoId) {
        this.videoId = videoId;
        this.videoSrc = `http://localhost:8080/stream/video?title=${videoId}`;
        this.initializePlayer();
      }
    });
  }

  initializePlayer(): void {
    this.player = videojs('video', {
      sources: [{
        src: this.videoSrc,
        type: 'video/mp4'
      }],
      tracks: [] // Initialize with an empty array
    }, () => {
      console.log('Player is ready');
      // Load subtitles after player is ready
      this.loadSubtitles('en'); // Load English subtitles by default
      this.loadSubtitles('es'); // Load Spanish subtitles
    });
  }

  loadSubtitles(lang: string): void {
    const body = { title: this.videoId, lang: lang };
    fetch('http://localhost:8080/stream/subtitles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(response => response.text())
    .then(subtitleText => {
      const blob = new Blob([subtitleText], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);

      // Remove previous subtitles of this language
      const tracks = this.player.remoteTextTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles' && track.language === lang) {
          this.player.removeRemoteTextTrack(track);
        }
      }

      // Add new subtitles
      this.player.addRemoteTextTrack({
        kind: 'subtitles',
        src: url,
        srclang: lang,
        label: lang === 'en' ? 'English' : 'Español',
        default: lang === 'en'
      }, true);
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
