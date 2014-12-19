module.exports = function(Velocity, utils){

  /**
   * compile
   */
  utils.mixin(Velocity.prototype, {
    init: function(){
      this.context = {};
      this.macros = {};
      this.conditions = [];
      this.local = {};
      this.silence = false;
      this.unescape = {};
    },

    /**
     * @param context {object} 上下文环境，数据对象
     * @param macro   {object} self defined #macro
     * @param silent {bool} 如果是true，$foo变量将原样输出
     * @return str
     */
    render: function(context, macros, silence){

      this.silence = !!silence;
      this.context = context || {};
      this.jsmacros = macros || {};
      var t1 = utils.now();
      var str = this._render();
      var t2 = utils.now();
      var cost = t2 - t1;

      this.cost = cost;

      return str;
    },

    /**
     * 解析入口函数
     * @param ast {array} 模板结构数组
     * @param contextId {number} 执行环境id，对于macro有局部作用域，变量的设置和
     * 取值，都放在一个this.local下，通过contextId查找
     * @return {string}解析后的字符串
     */
    _render: function(asts, contextId){

      var str = '';
      asts = asts || this.asts;

      if (contextId) {

        if (contextId !== this.condition && 
            utils.indexOf(contextId, this.conditions) === -1) {
          this.conditions.unshift(contextId);
        }

        this.condition = contextId;

      } else {
        this.condition = null;
      }

      utils.forEach(asts, function(ast){

        switch(ast.type) {
          case 'references':
            str += this.getReferences(ast, true);
          break;

          case 'set':
            this.setValue(ast);
          break;

          case 'break':
            this.setBreak = true;
          break;

          case 'macro_call':
            str += this.getMacro(ast);
          break;

          case 'comment':
            break;

          default:
            str += typeof ast == 'string' ? ast : this.getBlock(ast);
          break;
        }
      }, this);

      return str;
    }
  });
};
