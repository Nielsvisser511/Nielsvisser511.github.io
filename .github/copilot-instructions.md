# GitHub Pages Static Site - Nielsvisser511.github.io

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

This is a minimal GitHub Pages repository that serves as a custom domain redirect to vinser.me. The repository contains only essential static files with no build process, dependencies, or complex workflows.

## Repository Structure

The repository contains only:
- `README.md` (26 bytes): Contains "# Nielsvisser511.github.io"
- `CNAME` (10 bytes): Contains "vinser.me" for custom domain configuration
- `.git/` directory for version control
- `.github/` directory for GitHub-specific configurations

## Working Effectively

### Initial Setup and Validation
- Clone the repository: `git clone https://github.com/Nielsvisser511/Nielsvisser511.github.io.git`
- Navigate to directory: `cd Nielsvisser511.github.io`
- Verify repository contents: `ls -la` (should show README.md and CNAME files only)
- Check git status: `git status` (completes in <1 second)

### Development Workflow
**NO BUILD PROCESS EXISTS** - This is a static GitHub Pages site with no dependencies, package.json, or build tools.

#### Local Development Server
- Start local development server: `python3 -m http.server 8000`
  - Server starts in ~2 seconds
  - Access at http://localhost:8000
  - NEVER CANCEL - Allow 10+ seconds for full startup if needed
- Test file access:
  - README.md: `curl http://localhost:8000/README.md`
  - CNAME: `curl http://localhost:8000/CNAME`
- Stop server: `Ctrl+C` or `pkill -f "python3 -m http.server"`

#### Alternative Development Server (if port 8000 busy)
- Use different port: `python3 -m http.server 8001`
- Always check for existing servers: `netstat -tuln | grep ":8000"`

### File Operations
- View README.md: `cat README.md`
- View CNAME: `cat CNAME`
- Edit files with any text editor
- **DO NOT** add package.json, node_modules, or build tools - this is intentionally minimal

## Validation Scenarios

### CRITICAL Validation Steps
After making any changes, ALWAYS run these validation scenarios:

#### 1. Local Server Validation
```bash
# Start local server
python3 -m http.server 8000 &
SERVER_PID=$!

# Wait for server startup (2-3 seconds)
sleep 3

# Test README.md access
curl -s http://localhost:8000/README.md

# Test CNAME access  
curl -s http://localhost:8000/CNAME

# Test directory listing
curl -s http://localhost:8000/ | grep -E "(README|CNAME)"

# Cleanup
kill $SERVER_PID 2>/dev/null
```

#### 2. Git Status Validation
```bash
# Check repository status
git status

# Verify no unexpected files were added
git diff --name-only

# Check current branch
git branch
```

#### 3. File Content Validation
```bash
# Verify README.md content
echo "README.md should contain: # Nielsvisser511.github.io"
cat README.md

# Verify CNAME content
echo "CNAME should contain: vinser.me"
cat CNAME
```

## Command Timing Expectations

- `ls -la`: <1 second
- `git status`: <1 second
- `cat README.md` or `cat CNAME`: <1 second
- `python3 -m http.server startup`: ~2 seconds
- File access via curl: <1 second

## GitHub Pages Deployment

- **NO MANUAL DEPLOYMENT NEEDED** - GitHub Pages automatically serves files from this repository
- Custom domain configured via CNAME file points to vinser.me
- Changes pushed to main branch are automatically deployed
- **VALIDATION NOTE**: External site access may be blocked in sandboxed environments

## Common Tasks

### Adding New Static Files
1. Create HTML, CSS, or other static files in repository root
2. Test locally: `python3 -m http.server 8000`
3. Validate file access: `curl http://localhost:8000/filename.html`
4. Commit and push changes

### Modifying Domain Configuration
1. Edit CNAME file: `echo "newdomain.com" > CNAME`
2. Validate content: `cat CNAME`
3. Test locally to ensure file serves correctly
4. Commit and push changes

### Repository Maintenance
1. Check status: `git status`
2. View recent commits: `git log --oneline -5`
3. Check remote configuration: `git remote -v`

## Troubleshooting

### Local Server Issues
- If port 8000 busy: Use `python3 -m http.server 8001`
- Check running servers: `netstat -tuln | grep ":800"`
- Kill existing servers: `pkill -f "python3 -m http.server"`

### File Access Issues
- Verify file exists: `ls -la filename`
- Check file permissions: `ls -l filename`  
- Verify content: `cat filename`

### Git Issues
- Check branch: `git branch -a`
- Verify remote: `git remote -v`
- Check repository URL in clone command

## NEVER DO
- **DO NOT** run `npm install` - no package.json exists
- **DO NOT** try to build - no build process exists
- **DO NOT** add complex dependencies - keep repository minimal
- **DO NOT** cancel the local server startup - allow 10+ seconds if needed
- **DO NOT** assume external site access will work in all environments

## Repository Output Reference

### `ls -la` output
```
total 24
drwxr-xr-x 4 runner docker 4096 Sep  9 16:29 .
drwxr-xr-x 3 runner docker 4096 Sep  9 16:23 ..
drwxr-xr-x 7 runner docker 4096 Sep  9 16:29 .git
drwxr-xr-x 2 runner docker 4096 Sep  9 16:29 .github
-rw-r--r-- 1 runner docker   10 Sep  9 16:24 CNAME
-rw-r--r-- 1 runner docker   26 Sep  9 16:24 README.md
```

### `cat README.md` output
```
# Nielsvisser511.github.io
```

### `cat CNAME` output
```
vinser.me
```

### `git remote -v` output
```
origin	https://github.com/Nielsvisser511/Nielsvisser511.github.io (fetch)
origin	https://github.com/Nielsvisser511/Nielsvisser511.github.io (push)
```