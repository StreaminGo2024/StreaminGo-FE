import { AuthService } from './../../services/auth.service';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { CommonModule, NgClass } from '@angular/common';
import { UsersComponent } from '../users/users.component';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersComponent, NgClass],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamComponent implements OnInit{
  mostrarChat=false;
  usuarioLogeado: any;
  nuevoMensaje:string="";
  mensajes: any = [
  ]
  constructor(private authService:AuthService){ }

  ngOnInit(): void {
    this.authService.getUserLogged().subscribe(usuario => {
      this.usuarioLogeado = usuario;
    });
  }
  enviarMensaje(){

    if(this.nuevoMensaje=="")return;

    console.log(this.nuevoMensaje);
    let mensaje={
      emisor: this.usuarioLogeado.id,
      texto: this.nuevoMensaje
    }
    this.mensajes.push(mensaje);

    this.nuevoMensaje = "";

    setTimeout(()=> {
      this.scrollToTheLastElementByClassName();
    }, 10);
  }

  scrollToTheLastElementByClassName(){
    let elements=document.getElementsByClassName('msj');
    let ultimo:any=elements[(elements.length - 1)];
    let toppos = ultimo.offsetTop;

    
    const contenedorDeMensajes = document.getElementById('contenedorDeMensajes');
    if (contenedorDeMensajes) {
      contenedorDeMensajes.scrollTop = toppos;
    }

  }
}
