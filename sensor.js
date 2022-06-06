class Sensor
{
    constructor(car)
    {
        this.car = car;
        this.ray_count = 5;
        this.ray_length = 150;
        this.ray_spread = Math.PI / 2;

        this.rays = [];
        this.readings = [];
    }

    update(road_borders, traffic)
    {
        this.#cast_rays();
        this.readings = [];
        for(let i = 0; i < this.rays.length; i++)
        {
            this.readings.push(
                this.#get_readings(
                    this.rays[i], 
                    road_borders,
                    traffic
                    )
            );
        }
    }

    #get_readings(ray, road_borders, traffic)
    {
        let touches = [];
        for (let i = 0; i < road_borders.length; i++)
        {
            const touch = get_intersection(
                ray[0],
                ray[1],
                road_borders[i][0],
                road_borders[i][1]
            );
            if(touch)
            {
                touches.push(touch);
            }
        }

        for (let i = 0; i < traffic.length; i++)
        {
            const traffic_poly = traffic[i].polygon;
            for (let j = 0; j < traffic_poly.length; j++)
            {
                const value = get_intersection(
                    ray[0],
                    ray[1],
                    traffic_poly[j],
                    traffic_poly[(j + 1) % traffic_poly.length]
                );
                if(value)
                {
                    touches.push(value);
                }
            }
        }

        if(touches.length == 0)
        {
            return null;
        }
        else
        {
            const offsets = touches.map(e=>e.offset);
            const min_offset = Math.min(...offsets);
            return touches.find(e=>e.offset==min_offset);
        }
    }

    #cast_rays()
    {
        this.rays = [];
        for(let i = 0; i < this.ray_count; i++)
        {
            const ray_angle = lerp(
                this.ray_spread / 2,
                - this.ray_spread / 2,
                this.ray_count==1?0.5:i/(this.ray_count - 1)
            ) + this.car.angle;
            
            const start = {x:this.car.x, y:this.car.y};
            const end = {
                x:this.car.x - Math.sin(ray_angle) * this.ray_length,
                y:this.car.y - Math.cos(ray_angle) * this.ray_length
            };
            this.rays.push([start, end]);
        }
    }

    draw(ctx)
    {
        for(let i = 0; i < this.ray_count; i++)
        {
            let end = this.rays[i][1];
            if(this.readings[i])
            {
                end = this.readings[i];
            }
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}