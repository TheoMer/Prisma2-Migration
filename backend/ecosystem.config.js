module.exports = {
  apps : [{
    name: 'API',
    //script: './src/index.ts',
    script: 'ts-node',

    //Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/#ecosystem-file
    //args: 'one two',
    args: './src/index.ts',
    //instances: 1,
    instances: 'max',
    exec_mode : 'cluster',
    autorestart: true,
    watch: ["src"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules"],
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
