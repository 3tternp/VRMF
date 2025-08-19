# RiskGuard - Risk Management Platform

A comprehensive risk management platform built with Encore.ts and React, designed to help organizations identify, assess, and mitigate risks across various compliance frameworks.

## Features

- **Risk Assessment**: Comprehensive risk identification and scoring
- **Compliance Frameworks**: Support for NIST RMF, ISO 27001, SOC 2, GDPR, HIPAA, and PCI DSS
- **Risk Controls**: Manage preventive, detective, and corrective controls
- **Dashboard Analytics**: Visual risk heatmaps and trend analysis
- **Role-based Access**: Admin, Risk Officer, and Auditor roles
- **Real-time Updates**: Live dashboard with risk metrics
- **Profile Management**: User profiles with image upload support

## Technology Stack

- **Backend**: Encore.ts with TypeScript
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Object Storage**: Built-in Encore.ts object storage for profile images
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git

### Running the Application

1. **Clone the repository**
   ```bash
   git clone https://github.com/3tternp/VRMF
   cd VRMF
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Application: http://localhost:4000
   - Database: localhost:5432
   - Redis: localhost:6379

### Default Login Credentials

- **Administrator**: admin@company.com / admin123456

**Note**: Only administrators can create other users. After logging in as admin, go to the Users page to create additional accounts for Risk Officers and Auditors.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis (optional)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your local database and other settings
   ```

3. **Start the database**
   ```bash
   docker-compose up postgres redis -d
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## User Management

### Roles and Permissions

- **Administrator**: Full access to all features, can create/manage users
- **Risk Officer**: Can create and manage risks and controls
- **Auditor**: Read-only access to risks and controls

### Creating Users

Only administrators can create new users:

1. Log in as admin using the default credentials
2. Navigate to the "Users" page in the main menu
3. Click "Create User" and fill in the required information
4. Assign appropriate role (admin, risk_officer, or auditor)

### Profile Management

Users can manage their profiles including:
- Personal information (name, email)
- Profile picture upload (JPEG, JPG, PNG only, max 5MB)
- Password changes
- Two-factor authentication setup

## Docker Configuration

### Services

- **app**: Main RiskGuard application
- **postgres**: PostgreSQL database
- **redis**: Redis cache
- **nginx**: Reverse proxy with rate limiting

### Environment Variables

Key environment variables for Docker deployment:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/riskguard
REDIS_URL=redis://redis:6379
PORT=4000
```

### Production Deployment

1. **Update environment variables**
   ```bash
   # Set secure passwords and secrets
   POSTGRES_PASSWORD=your-secure-password
   JWT_SECRET=your-jwt-secret
   SESSION_SECRET=your-session-secret
   ```

2. **Configure SSL (optional)**
   - Place SSL certificates in `./ssl/` directory
   - Uncomment HTTPS server block in `nginx.conf`

3. **Deploy**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Health Checks

The application includes health checks for all services:

- **Application**: `GET /health`
- **Database**: PostgreSQL connection check
- **Redis**: Redis ping check

### Monitoring

Monitor the application using:

```bash
# View logs
docker-compose logs -f app

# Check service status
docker-compose ps

# Monitor resource usage
docker stats
```

## API Documentation

### Authentication

All API endpoints (except login) require authentication via Bearer token:

```bash
Authorization: Bearer <token>
```

### Key Endpoints

- `POST /auth/login` - User authentication
- `GET /risks` - List all risks
- `POST /risks` - Create new risk
- `GET /risks/:id` - Get risk details
- `PUT /risks/:id` - Update risk
- `GET /risks/dashboard` - Dashboard statistics
- `GET /controls` - List risk controls
- `POST /controls` - Create risk control
- `POST /users` - Create new user (admin only)
- `GET /users` - List all users (admin only)
- `POST /user/upload-profile-image` - Upload profile image
- `PUT /user/profile-image` - Update profile image URL

## Security Features

- **Rate Limiting**: API and login endpoint protection
- **CORS Protection**: Configurable origin restrictions
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **Input Validation**: Comprehensive request validation
- **Role-based Access**: Granular permission system
- **File Upload Security**: Restricted file types and sizes for profile images

## File Upload Guidelines

### Profile Images

- **Supported formats**: JPEG, JPG, PNG only
- **Maximum file size**: 5MB
- **Recommended dimensions**: 400x400 pixels
- **Storage**: Secure object storage with public access for display

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec riskguard-db pg_dump -U postgres riskguard > backup.sql

# Restore backup
docker exec -i riskguard-db psql -U postgres riskguard < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v riskguard_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Verify connection
   docker exec riskguard-db psql -U postgres -c "SELECT 1"
   ```

2. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Restart services
   docker-compose restart
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Login Issues**
   - Ensure you're using the correct default credentials: admin@company.com / admin123456
   - Check that the database migrations have run successfully
   - Verify the application logs for authentication errors

### Performance Tuning

- Adjust PostgreSQL settings in `docker-compose.yml`
- Configure Redis memory limits
- Tune Nginx worker processes
- Monitor resource usage with `docker stats`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
