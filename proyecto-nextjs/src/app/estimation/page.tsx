'use client'

import Map from '@/components/map'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function EstimationPage(){
    return <div>
        <Card>
          <CardHeader>Hola Tarjeta</CardHeader>
          <CardContent>Contenido</CardContent>
        </Card>
        <Card>
        <CardContent>
        <Map zoom={15} position={{lat: 4.71, lng: -74.13 }} />
        </CardContent>
        </Card>
        <Card>
          <Button>Volver</Button>
        </Card>
    </div>
}