# Getting Started with Media Scraper

Welcome! This guide will help you get the Media Scraper up and running in minutes.

## 🎯 What This Application Does

The Media Scraper is a full-stack application that:

1. Accepts multiple website URLs
2. Scrapes all images and videos from those pages
3. Stores the media information in a database
4. Displays everything in a beautiful, searchable gallery

## 🚀 Quick Start (5 Minutes)

### Step 1: Prerequisites

Make sure you have Docker installed:

```bash
docker --version
```

If not installed, download from: https://www.docker.com/products/docker-desktop

### Step 2: Start the Application

```bash
# Navigate to the project
cd /Users/ngocht/Documents/projects/media-scraper

# Start all services (this will take a few minutes the first time)
./start.sh
```

Wait for the message: "🎉 Services started!"

### Step 3: Open the Application

Open your browser and go to: **http://localhost:3000**

### Step 4: Try It Out!

1. In the text area, enter some URLs (one per line), for example:

   ```
   https://example.com
   https://unsplash.com
   https://wikipedia.org
   ```

2. Click **"Start Scraping"**

3. Wait a few seconds, then refresh the page to see the scraped media!

### Step 5: Explore Features

- **Filter by Type**: Use the dropdown to show only images or videos
- **Search**: Type keywords to find specific media
- **Pagination**: Navigate through pages of results
- **View Stats**: See total media count at the top

### Step 6: Stop the Application

```bash
./stop.sh
```

## 📖 Detailed Usage

### Scraping URLs

The application can scrape:

- ✅ Images from `<img>` tags
- ✅ Videos from `<video>` tags
- ✅ Embedded videos (YouTube, Vimeo, etc.)
- ✅ Background images (coming soon)

Tips:

- Works best with public websites
- Some sites may block scraping
- Processing time depends on page size

### Searching and Filtering

**Search by**:

- Image/video titles
- Alt text
- Source URL
- Media URL

**Filter by**:

- All media
- Images only
- Videos only

### API Access

You can also use the API directly:

**Submit URLs for scraping**:

```bash
curl -X POST http://localhost:3001/scrape \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com"]}'
```

**Get scraped media**:

```bash
curl "http://localhost:3001/media?page=1&limit=20"
```

**Get statistics**:

```bash
curl http://localhost:3001/stats
```

## 🧪 Running Load Tests

To test the system with 5000 concurrent requests:

```bash
cd backend
npm install
npm run test:load
```

This will show:

- Requests per second
- Average latency
- Error rate
- System performance metrics

## 🔧 Advanced Configuration

### Changing Ports

Edit `docker-compose.yml` to change default ports:

- Frontend: 3000
- Backend: 3001
- PostgreSQL: 5432
- Redis: 6379

### Adjusting Resources

Edit `docker-compose.yml` under `deploy.resources`:

```yaml
resources:
  limits:
    cpus: '0.5'
    memory: 512M
```

### Environment Variables

**Backend** (`backend/.env`):

- `DATABASE_URL`: Database connection string (e.g., `postgresql://user:pass@host:port/db`)
- `REDIS_HOST`: Redis hostname
- `PORT`: API port

**Frontend** (`frontend/.env.local`):

- `NEXT_PUBLIC_API_URL`: Backend API URL

## 🐛 Troubleshooting

### Services Won't Start

**Problem**: Port already in use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Stop the conflicting process or change ports in docker-compose.yml
```

**Problem**: Docker not running

```bash
# Start Docker Desktop, then try again
./start.sh
```

### Can't See Scraped Media

**Problem**: Media not appearing after scraping

- Wait a few seconds (scraping takes time)
- Refresh the page
- Check backend logs: `docker-compose logs backend`

**Problem**: Some images not loading

- Some URLs may be invalid
- Image hosts may block external access
- Check browser console for errors

### Performance Issues

**Problem**: Slow scraping

- Increase worker concurrency in `scraping.processor.ts`
- Add more memory to containers
- Check Redis and PostgreSQL performance

**Problem**: Out of memory

- Reduce worker concurrency
- Increase Docker memory limit
- Check for memory leaks in logs

### Database Issues

**Problem**: Database connection failed

```bash
# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Check Resource Usage

```bash
docker stats
```

This shows CPU and memory usage for each container.

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it media-scraper-db psql -U postgres -d mediascraper

# View media table
SELECT COUNT(*), type FROM media GROUP BY type;
```

## 🎓 Understanding the Architecture

```
┌─────────────────┐
│  Your Browser   │
│  localhost:3000 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js UI    │  - Gallery display
│   (Frontend)    │  - URL submission
└────────┬────────┘  - Search/filter
         │
         ▼ HTTP API
┌─────────────────┐
│   NestJS API    │  - REST endpoints
│   (Backend)     │  - Business logic
└────┬────┬───────┘
     │    │
     │    └─────────► Redis (Queue)
     │               - Job queue
     │               - 50 workers
     │
     └──────────────► PostgreSQL (Database)
                     - Media storage
                     - Persistence
```

## 📚 Learn More

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical details
- [CHECKLIST.md](CHECKLIST.md) - Implementation verification

## 💡 Tips and Best Practices

1. **Start Small**: Test with a few URLs first
2. **Check Stats**: Monitor the stats dashboard for progress
3. **Use Filters**: Filter by type to find specific media faster
4. **Monitor Resources**: Use `docker stats` to watch performance
5. **Regular Cleanup**: Periodically clear old data if needed

## 🎉 Next Steps

Now that you're running:

1. Try scraping your favorite websites
2. Experiment with different filters
3. Check out the API endpoints
4. Run the load test to see performance
5. Customize the frontend to your liking

## 🤝 Need Help?

- Check the troubleshooting section above
- Review the logs: `docker-compose logs -f`
- Verify all services are running: `docker-compose ps`
- Check the documentation files in the project

---

**Happy Scraping! 🚀**
