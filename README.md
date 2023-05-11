
# Flight API

La aerolínea Andes Airlines, está evaluando comenzar sus operaciones en países de latinoamérica. Para esto, necesita saber si es posible realizar un check-in automático de sus pasajeros.
Los puntos a tomar en cuenta son:
- Todo pasajero menor de edad debe quedar al lado de al menos uno de sus acompañantes mayores de edad (se
puede agrupar por el id de la compra).
- Si una compra tiene, por ejemplo, 4 tarjetas de embarque, tratar en lo posible que los asientos que se asignen
estén juntos, o queden muy cercanos (ya sea en la fila o en la columna).
- Si una tarjeta de embarque pertenece a la clase “económica”, no se puede asignar un asiento de otra clase.

Se desarrollo una API en `Node` con `JavaScript ` con una base de datos en `MySQL`


## Installation

Install my-project with npm.

1. Clone this repository: 

```bash
  git clone https://github.com/bramireza/Flight-API.git

```
2. Install dependencies:

```bash
  cd Flight-API
  npm install
```

3. Crete a `.env` file in the root directory of the project with the following environment variables:

```bash
  PORT = YOUR_PORT

  DATABASE_HOST = YOUR_HOST
  DATABASE_USER = YOUR_USER
  DATABASE_PASSWORD = YOUR_PASSWORD
  DATABASE_DATABASE = YOUR_DATABASE
```

4. Start the server

```bash
  npm run start
```

## API Reference

#### Get One Random Meme

| Endpoint | Method     | Description                |
| :-------- | :------- | :------------------------- |
| `/fligths/:id/passengers` | `GET` | Return checkin simulation |




## Explanation

Este código Javascript implementa una función `getFlightCheckin()` que genera el check-in de los pasajeros que abordan un vuelo específico. La función importa tres modelos previamente definidos (flightModel, boardingPassModel y seatModel) y utiliza varias funciones auxiliares para asignar asientos a los pasajeros, remover datos sensibles (la propiedad flight_id) y convertir las llaves de objetos de snake_case a camelCase.

Más precisamente, la función principal `getFlightCheckin()` realiza lo siguiente:

1. Obtiene información del vuelo, utilizando la función `getFlightById()` del modelo flightModel.
2. Obtiene información de los pasajeros registrados en el vuelo, utilizando la función `getBoardingPassByFlightId()` del modelo boardingPassModel.
3. Obtiene una lista completa de los asientos del avión, utilizando la función `getSeatsByAirplaneId()` del modelo seatModel.
4. Agrupa los boletos de embarque (boardingPass) por compras (purchases) separadas.
5. Para cada grupo de compras, asigna un asiento a los adultos sin asientos y los asientos contiguos a los niños que viajan con adultos.
6. Finalmente, ordena los boletos de embarque (boardingPass) por seat_id, elimina la propiedad flight_id y devuelve la información del vuelo y las asignaciones de asientos de los pasajeros en formato `camelCase`.




## Deploy

https://flight-api-bramireza.vercel.app/fligths/1/passengers

