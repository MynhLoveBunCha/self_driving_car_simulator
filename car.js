class Car
{
    constructor(x, y, width, height, control_type, maxspeed=4)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxspeed = maxspeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damage=false;
        this.polygon = this.#create_polygon();
        
        if(control_type != 'DUMMY')
        {
            this.sensor = new Sensor(this);
        }
        this.controls = new Controls(control_type);
    }

    update(road_borders, traffic)
    {
        if(!this.damage)
        {
            this.polygon = this.#create_polygon();
            this.#move();
            this.damage = this.#assess_damage(road_borders, traffic);
        }
        if(this.sensor)
        {
            this.sensor.update(road_borders, traffic);    
        }
    }

    #assess_damage(road_borders, traffic)
    {
        // for road borders
        for(let i = 0; i < road_borders.length; i++)
        {
            if(poly_intersect(this.polygon, road_borders[i]))
            {
                return true;
            }
        }

        // for traffic
        for(let i = 0; i < traffic.length; i++)
        {
            if(poly_intersect(this.polygon, traffic[i].polygon))
            {
                return true;
            }
        }
        return false;
    }

    #create_polygon()
    {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        // top right corner - idx 0
        points.push({
            x:this.x - Math.sin(this.angle - alpha) * rad,
            y:this.y - Math.cos(this.angle - alpha) * rad
        });
        // top left corner - idx 1
        points.push({
            x:this.x - Math.sin(this.angle + alpha) * rad,
            y:this.y - Math.cos(this.angle + alpha) * rad
        });
        // bottom left corner - idx 2
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        // bottom right corner - idx 3
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        return points;
    }

    #move()
    {
        if(this.controls.forward)
        {
            this.speed += this.acceleration;
        }
        else if(this.controls.reverse)
        {
            this.speed -= this.acceleration;
        }
        if(this.speed > this.maxspeed)
        {
            this.speed=this.maxspeed;
        }
        if(this.speed < -this.maxspeed/2)
        {
            this.speed=-this.maxspeed/2;
        }
        if(this.speed > 0)
        {
            this.speed -= this.friction;
        }
        if(this.speed < 0)
        {
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction)
        {
            this.speed = 0;
        }

        if(this.speed != 0)
        {
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left)
            {
                this.angle += 0.03 * flip;
            }
            else if(this.controls.right)
            {
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx, color)
    {
        if(this.damage)
        {
            ctx.fillStyle = 'red';
        }
        else
        {
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++)
        {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();
        if(this.sensor)
        {
            this.sensor.draw(ctx);
        }
    }
}