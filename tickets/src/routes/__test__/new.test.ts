import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../__mocks__/nats-wrapper'

describe('For Ticketing service', () => {
  test('Has a route handler listening to the "/api/tickets" to the post request', async () => {
    const response = await request(app).post('/api/tickets').send({})

    expect(response.status).not.toEqual(404)
  })

  test('Can be access only to the sign in users', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({})
      .expect(401)
  })

  test('Return status other than 401 if user sign in', async () => {
    const cookie = global.signup()
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({})

    expect(response.status).not.toEqual(401)
  })

  test('Returns an error if invalid title is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signup())
      .send({
        title: '',
        price: 10,
      })
      .expect(400)

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signup())
      .send({
        price: 10,
      })
      .expect(400)
  })

  test('Returns an error if invalid price is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signup())
      .send({
        title: 'Henrique',
        price: -10,
      })
      .expect(400)

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signup())
      .send({
        title: 'Henrique',
      })
      .expect(400)
  })

  test('Create a ticket with valid inputs', async () => {
    let tickets = await Ticket.find()
    expect(tickets.length).toEqual(0)

    const title = 'asfsfdsg'
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signup())
      .send({
        title,
        price: 20,
      })
      .expect(201)

    tickets = await Ticket.find()
    expect(tickets.length).toEqual(1)
    expect(tickets[0].price).toEqual(20)
    expect(tickets[0].title).toEqual(title)
  })

  test('Publish an event', async () => {
    const title = 'asfsfdsg'
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signup())
      .send({
        title,
        price: 20,
      })
      .expect(201)

    // expect(natsWrapper.client.publish).toHaveBeenCalled()
  })
})
