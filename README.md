# Equine Wisdom

A comprehensive horse breed identification and education platform that helps horse owners discover their horse's breed and learn natural horse knowledge.

## Features

- **AI-Powered Breed Identification** - Describe your horse's characteristics and our AI analyzes them to suggest the most likely breed matches with confidence scores
- **Comprehensive Breed Database** - 28+ horse breeds with detailed information including physical characteristics, temperament, history, and care requirements
- **Educational Content** - 35+ natural horse facts organized by topic and experience level (beginner to advanced)
- **Browse & Search** - Filter breeds by category (light horses, draft, ponies, gaited, warmbloods) and search by name or characteristics
- **Responsive Design** - Works seamlessly on desktop and mobile devices for use in stables and fields
- **User Authentication** - Optional login to save favorite breeds and track identification history

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI**: LLM-powered breed identification
- **Authentication**: Manus OAuth
- **Deployment**: Manus hosting platform

## Getting Started

### Prerequisites

- Node.js 22+ and pnpm 10+
- MySQL/TiDB database
- Manus account (for OAuth and API access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/equine-wisdom.git
   cd equine-wisdom
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```
   See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Seed the database with breeds and facts**
   ```bash
   npx tsx scripts/seed-breeds.ts
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
equine-wisdom/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   └── _core/             # Core framework files
├── drizzle/               # Database schema and migrations
├── scripts/               # Utility scripts (seed data, etc.)
└── shared/                # Shared types and constants
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run unit tests with Vitest
- `pnpm db:push` - Apply database migrations
- `pnpm check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier

## Database Schema

### Breeds Table
- Comprehensive horse breed information
- Physical characteristics (height, weight, colors)
- Temperament and behavioral traits
- Historical background and origin
- Care requirements and feeding notes
- Health considerations

### Horse Facts Table
- Educational content for all experience levels
- Organized by category (general, health, behavior, nutrition, training, history, care)
- Source attribution
- Audience level targeting (beginner, intermediate, advanced, all)

### Users Table
- User authentication and profile data
- Role-based access control (user, admin)
- Login history tracking

### Identification History Table
- Tracks user breed identification requests
- Stores matched breeds and confidence scores
- Enables personalized recommendations

## API Endpoints

All API endpoints are implemented as tRPC procedures. Key endpoints include:

### Breeds
- `breeds.list` - Get all breeds
- `breeds.getBySlug` - Get a specific breed by slug
- `breeds.search` - Search breeds by query
- `breeds.byCategory` - Filter breeds by category
- `breeds.popular` - Get popular breeds

### Facts
- `facts.list` - Get all facts
- `facts.byCategory` - Filter facts by category
- `facts.byLevel` - Filter facts by audience level
- `facts.random` - Get random facts

### Identification
- `identify.analyze` - Analyze horse description and suggest breeds
- `identify.history` - Get user's identification history (requires authentication)

## Security

This project follows security best practices:

- **Environment Variables**: All sensitive information is stored in environment variables, never hardcoded
- **.gitignore**: Comprehensive `.gitignore` excludes all sensitive files
- **No API Keys in Code**: API keys and credentials are managed through environment variables
- **Database Credentials**: Connection strings are environment-based
- **Authentication**: Manus OAuth handles user authentication securely

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for security guidelines.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Testing

Run the test suite:
```bash
pnpm test
```

Tests are written with Vitest and cover:
- API endpoint functionality
- Database query helpers
- Authentication flows

## Deployment

This project is designed to be deployed on the Manus platform:

1. Push your code to GitHub
2. Connect your repository to Manus
3. Configure environment variables in the Manus dashboard
4. Deploy with a single click

For other platforms (Vercel, Railway, etc.), ensure all environment variables are properly configured.

## Performance Considerations

- **Database Queries**: Optimized with proper indexing on frequently searched fields
- **Frontend**: React 19 with optimized rendering and lazy loading
- **Caching**: tRPC handles intelligent query caching
- **Search**: Full-text search on breed names and characteristics

## Future Enhancements

- [ ] Breed image gallery with user-submitted photos
- [ ] User favorites and saved breeds
- [ ] Advanced breed comparison tool
- [ ] Seasonal care guides and checklists
- [ ] First-aid and emergency care information
- [ ] Community forum for horse owners
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Horse breed information sourced from equine research and breed registries
- Educational content compiled from veterinary and equestrian experts
- Built with modern web technologies and best practices
