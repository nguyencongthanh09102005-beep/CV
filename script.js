// Robust Interactive CV script - replacement
// (Paste this whole file into script.js, save, then reload the page)

(function(){
  'use strict';

  // tiny helper để log một cách có tag
  const dbg = (...args) => console.log('[CV Debug]', ...args);

  // chạy khi DOM sẵn sàng
  document.addEventListener('DOMContentLoaded', () => {
    try {
      dbg('DOM ready - init');

      const menuItems = Array.from(document.querySelectorAll('.menu-item'));
      const heroTitle = document.getElementById('heroTitle');
      const heroSubtitle = document.getElementById('heroSubtitle');
      const heroContent = document.getElementById('heroContent');

      if (!heroContent) {
        dbg('Lỗi: Không tìm thấy #heroContent trong DOM');
        return;
      }

      // helper: prób tìm template theo các kiểu id khác nhau
      function findTemplateByKey(key) {
        // 1. try exact key (e.g. 'tpl-hobbies' if key is 'tpl-hobbies')
        let t = document.getElementById(key);
        if (t && t.content) return t;
        // 2. try prefix 'tpl-' + key (menu data-target might be 'hobbies')
        t = document.getElementById('tpl-' + key);
        if (t && t.content) return t;
        // 3. try suffix removal (if key was tpl-info and template is info)
        if (key.startsWith('tpl-')) {
          const short = key.slice(4);
          t = document.getElementById(short);
          if (t && t.content) return t;
        }
        // not found
        return null;
      }

      // build map of available templates (for debug)
      const availableTplIds = Array.from(document.querySelectorAll('template[id]')).map(t => t.id);
      dbg('Available templates:', availableTplIds);

      // state
      let current = null;

      // setContent: nhận key = data-target từ menu-item
      function setContent(key) {
        try {
          dbg('setContent ->', key);
          const tplEl = findTemplateByKey(key);
          if (!tplEl) {
            // show friendly message and log
            dbg('Template not found for key:', key);
            heroContent.innerHTML = `<div class="info-card"><p style="color:var(--text)">Không tìm thấy nội dung cho <strong>${key}</strong>. Kiểm tra id của <code>&lt;template&gt;</code> (ví dụ: id="tpl-${key}" hoặc id="${key}").</p></div>`;
            // update active menu UI anyway
            menuItems.forEach(mi => mi.classList.toggle('active', mi.dataset.target === key));
            // update title minimal
            if (heroTitle) heroTitle.textContent = key;
            return;
          }

          // update active menu UI
          menuItems.forEach(mi => mi.classList.toggle('active', mi.dataset.target === key));

          // fade out/in classes (safe toggle)
          heroContent.classList.add('fade-out');
          heroContent.classList.remove('fade-in');

          setTimeout(() => {
            // clear + clone content
            heroContent.innerHTML = '';
            const clone = tplEl.content.cloneNode(true);
            heroContent.appendChild(clone);

            // small title handling (if you want specific titles for keys)
            if (heroTitle) {
              // prefer nice mapping if template id uses tpl- prefix
              const nice = {
             'tpl-info': 'Thông tin',
              'tpl-career': 'Mục tiêu',
              'tpl-skills': 'Kỹ năng',
             'tpl-hobbies': 'Sở thích',
             'tpl-projects': 'Dự án',
              'tpl-contact': 'Liên hệ'
            };

              heroTitle.textContent = nice[key] || (nice['tpl-'+key] || heroTitle.textContent);
            }

            // animate any .progress inside the newly injected content
            heroContent.querySelectorAll('.progress').forEach(el => {
              try {
                const pct = (el.dataset.percent || el.textContent || '').toString().replace('%','').trim();
                el.style.width = '0';
                if (pct && !isNaN(Number(pct))) {
                  setTimeout(() => { el.style.width = pct + '%'; }, 150);
                }
              } catch (e) { /* ignore */ }
            });

            // finish fade-in
            heroContent.classList.remove('fade-out');
            heroContent.classList.add('fade-in');

          }, 200);

        } catch (err) {
          console.error('[CV Error] setContent error:', err);
        }
      }

      // bind click handlers for existing menu items
      if (menuItems.length === 0) {
        dbg('Không tìm thấy .menu-item nào trên trang');
      } else {
        menuItems.forEach(mi => {
          mi.addEventListener('click', (ev) => {
            ev.preventDefault();
            const key = (mi.dataset.target || '').trim();
            if (!key) {
              dbg('menu-item missing data-target attribute', mi);
              return;
            }
            if (key === current) return;
            current = key;
            setContent(key);
          });
        });
      }

      // initial render: try to open active menu item or fallback to first menu-item
      const active = menuItems.find(m => m.classList.contains('active'));
      const startKey = (active && active.dataset.target) ? active.dataset.target : (menuItems[0] && menuItems[0].dataset.target) || 'tpl-info';
      current = startKey;
      setContent(startKey);

    } catch (outerErr) {
      console.error('[CV Fatal] init error:', outerErr);
    }
  });
})();
